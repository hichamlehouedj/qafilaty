export default (db, types) => {
	return db.define('user', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        user_name: {
            type: types.STRING(50),
            allowNull: false,
        },
        password: {
            type: types.STRING(255),
            allowNull: false
        },
        role: {
            type: types.STRING(20),
            allowNull: false
        },
        activation: {
            type: types.STRING(10),
            defaultValue: "active",
            allowNull: false
        },
        email_verify: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        lastConnection: {
            type: types.DATE,
            allowNull: false
        },
        lastDisconnection: {
            type: types.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: false,
        updatedAt: false,
        indexes: [
            {unique: true, fields: ['user_name'] }
        ]
    });
};