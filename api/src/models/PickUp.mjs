export default (db, types) => {
  return db.define('pickup', {
    id: {
      type: types.UUID,
      defaultValue: types.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    number_box: {
      type: types.INTEGER,
      allowNull: false
    },
    price: {
      type: types.DOUBLE,
      allowNull: false
    },
    deleted: {
      type: types.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    createdAt: {
      type: types.DATE,
      allowNull: false
    },
    updatedAt: {
      type: types.DATE,
      allowNull: false
    }
  }, {
    timestamps: true,
    createdAt: true,
    updatedAt: true
  });
};