export default (db, types) => {
	return db.define('client', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    },{
        timestamps: true,
        createdAt: false,
        updatedAt: false
    });
};