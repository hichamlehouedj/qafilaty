export default (db, types) => {
    return db.define('zone', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: types.STRING(50),
            allowNull: false
        },
        cities: {
            type: types.STRING(1000),
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