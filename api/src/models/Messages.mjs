export default (db, types) => {
  return db.define('message', {
    id: {
      type: types.UUID,
      defaultValue: types.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: types.STRING(50),
      allowNull: false
    },
    message: {
      type: types.STRING(255),
      allowNull: false
    },

    createdAt: {
      type: types.DATE,
      allowNull: false
    },
    updatedAt: {
      type: types.DATE,
      allowNull: false
    },
    deleted: {
      type: types.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  },{
    timestamps: true,
    createdAt: true,
    updatedAt: true
  });
};