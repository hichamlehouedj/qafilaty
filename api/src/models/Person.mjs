export default (db, types) => {
	return db.define('person', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: types.STRING(30),
            allowNull: false
        },
        last_name: {
            type: types.STRING(30),
            allowNull: false
        },
        email: {
            type: types.STRING(100),
            allowNull: true,
            // validate: {isEmail: true}
        },
        phone01: {
            type: types.STRING(15),
            allowNull: false
        },
        phone02: {
            type: types.STRING(15),
            allowNull: true
        },
        address: {
            type: types.STRING(50),
            allowNull: false
        },
        city: {
            type: types.STRING(30),
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
    },{
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        freezeTableName: true,
        indexes: [
            {unique: true, fields: ['email'] },
            {unique: true, fields: ['phone01'] }
        ]
    });
};