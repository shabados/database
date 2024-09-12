const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Paths to your files
const sqliteFilePath = path.resolve("build", "database.sqlite");
const sqliteDumpFilePath = path.resolve("build", "sqlite-dump.sql");
const mariadbDumpFilePath = path.resolve("build", "mysql-mariadb.sql");

// Check if the SQLite file exists
if (!fs.existsSync(sqliteFilePath)) {
    console.error(`SQLite file not found! Path: ${sqliteFilePath}`);
    console.warn(`Please run 'npm run build-sqlite' first.`);
    process.exit(1);
}

// Export SQLite database to SQL dump
const db = new sqlite3.Database(sqliteFilePath);

db.serialize(() => {
    // Query to get all table names excluding 'sqlite_sequence'
    db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'",
        (err, rows) => {
            if (err) {
                console.error("Error fetching table names:", err);
                db.close();
                process.exit(1);
            }

            // Process each table
            let sqlDump = "";
            let tablesProcessed = 0;
            const totalTables = rows.length;

            // turn it off at the top of the script
            if (tablesProcessed == 0) {
                sqlDump += "SET FOREIGN_KEY_CHECKS=0;\n";
            }

            // Drop tables
            rows.forEach(row => {
                const tableName = row.name;
                sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            });

            rows.forEach((row) => {
                const tableName = row.name;

                // Fetch table schema
                db.get(
                    `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
                    (err, tableRow) => {
                        if (err) {
                            console.error("Error fetching table creation SQL:", err);
                            db.close();
                            process.exit(1);
                        }

                        if (tableRow) {
                            sqlDump += tableRow.sql + ";\n";
                        }

                        // Fetch table data
                        db.all(`SELECT * FROM ${tableName}`, (err, dataRows) => {
                            if (err) {
                                console.error("Error fetching table data:", err);
                                db.close();
                                process.exit(1);
                            }

                            console.warn(`Processing: ${tableName}`)

                            if (dataRows.length > 0) {
                                dataRows.forEach((dataRow) => {
                                    const columns = "`" + Object.keys(dataRow).join("`, `") + "`";
                                    const values = Object.values(dataRow)
                                        .map((value) => {
                                            if (value === null) return "NULL";
                                            if (typeof value === "string") {
                                                // Handle JSON strings and other special cases
                                                value = `'${value.replace(/'/g, "''").replace(/\r?\n|\r/g, "\\n").replace(/"/g, '\\"')}'`;

                                                // Take care of \'
                                                return value.replace(/\\'/g, "'");
                                            }
                                            return value;
                                        })
                                        .join(", ");

                                    sqlDump += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});\n`;
                                });
                            }

                            tablesProcessed++;
                            // Check if all tables are processed
                            if (tablesProcessed === totalTables) {
                                // turn it on at the end of script
                                sqlDump += "SET FOREIGN_KEY_CHECKS=1;\n";

                                fs.writeFileSync(sqliteDumpFilePath, sqlDump);
                                console.log("\nInfo:: SQLite dump created successfully.");
                                console.warn("Processing:: Converting sqlite dump to mariadb format...");

                                // Convert SQLite SQL dump to MariaDB-compatible SQL
                                let content = fs.readFileSync(sqliteDumpFilePath, "utf8");

                                // Remove SQLite pragmas
                                content = content.replace(/PRAGMA.*;[\s]*/g, "");

                                // Convert INTEGER PRIMARY KEY to INT AUTO_INCREMENT PRIMARY KEY
                                content = content.replace(
                                    /integer not null primary key autoincrement/g,
                                    "INT AUTO_INCREMENT PRIMARY KEY"
                                );

                                // Replace AUTOINCREMENT with AUTO_INCREMENT
                                content = content.replace(/autoincrement/g, "AUTO_INCREMENT");

                                // Remove SQLite-specific options
                                content = content.replace(/WITHOUT ROWID/g, "");

                                fs.writeFileSync(mariadbDumpFilePath, content);
                                console.log("\nOperation Complete!");

                                db.close();
                            }
                        });
                    }
                );
            });
        }
    );
});
