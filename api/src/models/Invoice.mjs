export default (db, types) => {
    return db.define('invoice', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        code_invoice: {
            type: types.STRING(12),
            allowNull: false
        },
        points: {
            type: types.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        price: {
            type: types.DOUBLE,
            allowNull: false
        },
        status: {
            type: types.STRING(20),
            defaultValue: "pending"
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