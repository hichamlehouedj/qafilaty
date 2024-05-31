export default (db, types) => {
    return db.define('companies_offer', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        title: {
            type: types.STRING(100),
            allowNull: false
        },
        description: {
            type: types.STRING(255),
            allowNull: true
        },
        discount_return: {
            type: types.INTEGER(3),
            defaultValue: 0,
            allowNull: false
        },
        discount_delivery: {
            type: types.INTEGER(3),
            defaultValue: 0,
            allowNull: false
        },
        status: {
            type: types.STRING(20),
            allowNull: false,
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: true,
        updatedAt: true
    });
};