export default (db, types) => {
	return db.define('box_trace', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        status: {
            type: types.INTEGER(3),
            allowNull: false,
        },
        note: {
            type: types.STRING(255),
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