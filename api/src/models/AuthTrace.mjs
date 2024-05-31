export default (db, types) => {
	return db.define('auth_trace', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        token: {
            type: types.STRING(500),
            allowNull: false
        },
        user_name: {
            type: types.STRING(50),
            allowNull: false,
        },
        action: {
            type: types.STRING(50),
            allowNull: false,
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        }
    },{
        timestamps: true,
        createdAt: true,
        updatedAt: false,
        freezeTableName: true
    });
};