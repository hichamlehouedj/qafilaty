export default (db, types) => {
    return db.define('stock', {
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
        city: {
            type: types.STRING(50),
            allowNull: false
        },
        address: {
            type: types.STRING(100),
            allowNull: false
        },
        phone01: {
            type: types.STRING(15),
            allowNull: false
        },
        phone02: {
            type: types.STRING(15),
            allowNull: true
        },
        activation: {
            type: types.STRING(10),
            defaultValue: "active",
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
        }
    }, {
        timestamps: true,
        createdAt: true
    });
};