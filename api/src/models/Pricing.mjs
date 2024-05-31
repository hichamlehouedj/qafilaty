export default (db, types) => {
    return db.define('pricing', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        default_price_office: {
            type: types.DOUBLE,
            allowNull: false
        },
        default_price_house: {
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