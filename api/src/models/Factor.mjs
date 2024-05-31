export default (db, types) => {
	return db.define('factor', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        department: {
            type: types.STRING(30),
            allowNull: false
        },
        salary_type: {
            type: types.STRING(30),
            allowNull: false
        },
        salary: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
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