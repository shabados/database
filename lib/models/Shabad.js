/**
 * Objection Model for Shabads.
 * @ignore
 */

const { Model } = require( 'objection' )

class Shabads extends Model {
  static get tableName() {
    return 'Shabads'
  }

  static get relationMappings() {
    return {
      writer: {
        relation: Model.HasOneRelation,
        // eslint-disable-next-line
        modelClass: require( './Writers' )
      },
      raag: {
        relation: Model.HasOneRelation,
        // eslint-disable-next-line
        modelClass: require( './Raags' )
      },
      source: {
        relation: Model.HasOneRelation,
        // eslint-disable-next-line
        modelClass: require( './Sources' )
      },
      type: {
        relation: Model.HasOneRelation,
        // eslint-disable-next-line
        modelClass: require( './ShabadTypes' )
      },
      lines: {
        relation: Model.HasManyRelation,
        // eslint-disable-next-line
        modelClass: require( './Lines' )
      },
    }
  }
}

export default Shabads
