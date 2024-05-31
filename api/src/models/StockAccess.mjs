export default (db, types) => {
	return db.define('stock_access', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
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