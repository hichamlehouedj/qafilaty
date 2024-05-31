export default (db, types) => {
	return db.define('box', {
        id: {
            type: types.UUID,
            defaultValue: types.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        recipient_name: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_phone1: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_phone2: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_city: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_address: {
            type: types.STRING(50),
            allowNull: false,
        },
        recipient_loction: {
            type: types.STRING(255),
            defaultValue: "",
            allowNull:true,
        },
        code_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        status_box: {
            type: types.INTEGER(3),
            defaultValue: 0,
            allowNull: false,
        },
        command_number: {
            type: types.STRING(50),
            allowNull: false,
        },
        payment_type: {
            type: types.STRING(50),
            allowNull: false,
        },
        fragile: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        delivery_type: {
            type: types.STRING(20),
            allowNull: false,
        },
        categorie: {
            type: types.STRING(255),
            allowNull: false,
        },
        height_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        width_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        length_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        weight_box: {
            type: types.STRING(50),
            allowNull: false,
        },
        price_box: {
            type: types.DOUBLE,
            allowNull: false,
        },
        price_delivery: {
            type: types.DOUBLE,
            allowNull: false,
        },
        TVA: {
            type: types.INTEGER(11),
            allowNull: false,
        },
        note: {
            type: types.STRING(50),
            allowNull: false,
        },
        id_stock: {
            type: types.STRING(50),
            allowNull: false
        },
        paid_in_office: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        possibility_open: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        encapsulation: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },

        code_invoice: {
            type: types.STRING(15),
            defaultValue: "0",
            allowNull: false
        },
        code_envelope: {
            type: types.STRING(15),
            defaultValue: "0",
            allowNull: false
        },
        code_pick_up: {
            type: types.STRING(15),
            defaultValue: "",
            allowNull: true
        },
        price_pick_up: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false,
        },
        price_return: {
            type: types.DOUBLE,
            defaultValue: 0,
            allowNull: false,
        },
        code_driver_commission: {
            type: types.STRING(15),
            defaultValue: "",
            allowNull: true
        },

        cd_commission_pickup: {
            type: types.STRING(15),
            defaultValue: "",
            allowNull: true
        },

        id_driver: {
            type: types.STRING(50),
            allowNull: true
        },
        deleted: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        archived: {
            type: types.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    }, {
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        indexes: [
            {unique: true, fields: ['code_box'] }
        ]
    });
};