/**
 * Objection Model for Banis.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Banis extends BaseModel {
  static get tableName() {
    return 'Banis'
  }

  static get relationMappings() {
    return {
      lines: {
        relation: Model.ManyToManyRelation,
        join: {
          from: 'Banis.id',
          through: {
            from: 'Bani_Lines.bani_id',
            to: 'Bani_Lines.line_id',
          },
          to: 'Lines.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
    }
  }
}

module.exports = Banis
