/**
 * Objection Model for Lines, with custom query builder.
 * @ignore
 */

const { Model, QueryBuilder } = require( 'objection' )


class LineQueryBuilder extends QueryBuilder {
  /**
   * Given a string of first letters, return a query that searches for the shabad
   * @param letters The first letters to search for a partial match of
   */
  firstLetters( letters ) {
    return this.where( 'first+letters', 'GLOB', letters )
  }
}

class Lines extends Model {
  static get tableName() {
    return 'Lines'
  }

  static get QueryBuilder() {
    return LineQueryBuilder
  }

  static get relationMappings() {
    return {
      type: {
        relation: Model.HasOneRelation,
        // eslint-disable-next-line
        modelClass: require( './LineTypes' )
      },
      shabad: {
        relation: Model.BelongsToOneRelation,
        // eslint-disable-next-line
        modelClass: require( './Shabads' )
      },
    }
  }
}

export default Lines
