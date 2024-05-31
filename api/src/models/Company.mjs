export default (db, types) => {
	return db.define('company', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: types.STRING(30),
            allowNull: false
        },
        logo: {
            type: types.STRING(255),
            allowNull: false
        },
        phone01: {
            type: types.STRING(15),
            allowNull: false,
        },
        phone02: {
            type: types.STRING(15),
            allowNull: false
        },
        email: {
            type: types.STRING(50),
            allowNull: false,
            //validate: {isEmail: true}
        },
        url_site: {
            type: types.STRING(255),
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
        points: {
            type: types.INTEGER,
            defaultValue: 25,
            allowNull: false
        },

        TVA: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        plus_size: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        plus_tail: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        value_plus_size: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        value_plus_tail: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        return_price: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        change_price: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        price_in_state: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        pickup: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        pickup_price: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        encapsulation: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        encapsulation_price: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        defult_weight: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        defult_length: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        lastDateEmptyPoints: {
            type: types.DATE,
            allowNull: true
        },
        createdAt: {
            type: types.DATE,
            allowNull: false
        },
        updatedAt: {
            type: types.DATE,
            allowNull: false
        },
        activation: {
            type: types.STRING(10),
            defaultValue: "desactive",
            allowNull: false
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    },{
        timestamps: true,
        indexes: [
            {unique: true, fields: ['phone01'] },
            {unique: true, fields: ['name'] },
        ]
    });
};