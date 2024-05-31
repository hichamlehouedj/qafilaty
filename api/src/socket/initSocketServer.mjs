import { Server }   from "socket.io";
import {User, BoxTrace, Box, Person, Client} from "./../models/index.mjs"
import { format as dateFormat } from 'date-fns'
import { AuthSocket as AuthMiddleware } from "../middlewares/index.mjs";
import DB from '../config/DBContact.mjs'
import {Op, col, QueryTypes} from 'sequelize';
import RandToken from 'rand-token';

const { generator, uid } = RandToken;
const UNAUTHORIZED = 'You must be the authenticated user to get this information'

export default class socketServer {

	constructor(httpServer) {
		this.io = new Server(httpServer, {
			path: "/socket.io/",
			cors: {
				origin: ["https://stock.qafilaty.com", "https://client.qafilaty.com", "https://driver.qafilaty.com", "https://admin.qafilaty.com"]
			},
			credentials: true
		});

		//instrument(this.io, { auth: false })
		this.online_users = [];
		this.socketConnect = null;
	}

	getIds(id) {
		let data = []
		this.online_users.map(user_id => {
			if (user_id.split("_")[1] === id) {
				data.push(user_id)
			}
		})
		return data;
	}

	socketConfig() {
		this.io.use( async (socket, next)=>{
			const nowDate = new Date();
			const dateConnection = dateFormat(nowDate, "yyyy-MM-dd HH:mm:ss");

			let token = socket.handshake.auth.token || "";

			let Authorization = await AuthMiddleware(token)

			if (!Authorization.isAuth) {
				return next(new Error('You must be the authenticated user'));
			}

			if (socket.handshake.query.user_id == undefined || socket.handshake.query.user_id == "undefined") {
				console.log("*** No date config ***")
				return next(new Error("date config empty"));
			}

			socket['id'] = `${uid(3)}_${socket.handshake.query.user_id}` || this.online_users.length + 1;

			User.update({lastConnection: dateConnection}, {
				where: { id:  socket.handshake.query.user_id }
			})

			next();
		});
	}

	async connection() {
		this.socketConfig();
		this.socketConnect = await this.io.on('connection', async (socket) => {
			await this.socketInfo(socket)
			await this.sendNotifications(socket);

			this.getStatusBox(socket)

			//this.socketPacketCreate(socket)
			//this.socketPacket(socket)
			//this.socketUpgrade(socket)
			this.socketError(socket);
			this.socketDisconnect(socket);
			return await socket
		})
	}

	async socketInfo(socket) {
		console.log('\n***************************************************************************');
		console.log('*** New user information ************************************************** \n**');
		console.log('** \t A new user here his id => ', socket.id);
		console.log("** \t His room id : ", socket.handshake.query.stock_id)
		console.log("** \t Type transport connection : ", socket.conn.transport.name);
		console.log('**\n***************************************************************************');
		console.log('*** general information *************************************************** \n**');

		socket.join(socket.handshake.query.stock_id);

		let fetchSockets = await this.io.fetchSockets() // get all sockets
		this.online_users = []; // re-empty list online users
		fetchSockets.map(socket => {
			this.online_users.push(socket.id) // add just id user
		});

		console.log("** \t Number visitor connected ", this.io.of("/").sockets.size)
		console.log("** \t Online users ========> ", this.online_users);

		console.log('**\n***************************************************************************');
		console.log('*************************************************************************** \n');
	}

	async sendNewPoints(stocks, data) {
		let listStocks = []
		for (let i = 0; i < stocks.length; i++) {
			listStocks.push(stocks[i].id)
		}

		this.socketConnect.to(listStocks).emit("changePoints", data);
	}

	async sendNewData(id_client, stock, data) {
		const Ids = id_client !== 0 ? await this.getIds(id_client) : []
		Ids.map(id => this.socketConnect.to(id).emit("createBox", data))
		this.socketConnect.to(stock).emit("createBox", data);
	}

	async sendNewTrace(id_client, id_stock, data, id_driver) {
		const Ids = await this.getIds(id_client)
		Ids.map(id => this.socketConnect.to(id).emit("newTrace", data))

		this.socketConnect.to(id_stock).emit("newTrace", data);

		if (id_driver !== 0) {
			const Ids = await this.getIds(id_driver)
			Ids.map(id => this.socketConnect.to(id).emit("newTrace", data))
		}
	}

	async sendNotifications(socket) {
		const stock_id = socket.handshake.query.stock_id
		const origin = socket.request.headers.origin;
		
		const user = await User.findOne({
			where: { id: socket.id.split("_")[1] || "" }
		})
		
		console.log("sendNotifications ", socket.request.headers.origin)

		if (user.role === 'Client') {
			const dateDisconnection = user.lastDisconnection.getTime() || 0

			const boxTrace = await BoxTrace.findAll({
				where: {  },
				include: {
					model: Box,
					as: 'box',
					required: true,
					right: true,
					where: { id_client: socket.handshake.query.client_id, deleted: false }
				},
				order: [["createdAt", "DESC"]],
				limit: 50
			})

			let newActions = 0;
			let newTrace = [];
			boxTrace.map(trace => {
				if ("dataValues" in trace && "createdAt" in trace) {
					newTrace.push(trace.dataValues)
					if((trace.createdAt.getTime() - dateDisconnection) > 0) newActions++;
				}
			})

			socket.emit("notifications", {newActions, newTrace})
		} else if (
		    ( (user.role === 'Factor' || user.role === 'AdminCompany') && (origin == 'https://stock.qafilaty.com') ) ||
		    (user.role === 'Driver' && origin == 'https://driver.qafilaty.com') 
	        
		) {
			const dateDisconnection = user.lastDisconnection.getTime() || 0

			const boxTrace = await BoxTrace.findAll({
				include: {
					model: Box,
					as: 'box',
					required: true,
					right: true,
					attributes: ["code_box"],
					where: { id_stock: stock_id, deleted: false },
					include: {
						model: Client,
						as: 'client',
						required: true,
						right: true,
						include: {
							model: Person,
							as: 'person',
							required: true,
							right: true,
							attributes: ["first_name", "last_name"]
						}
					},
				},
				order: [["createdAt", "DESC"]],
				limit: 50
			})

			let newActions = 0;
			let newTrace = [];
			boxTrace.map(trace => {
				if ("dataValues" in trace && "createdAt" in trace) {
					newTrace.push(trace.dataValues)
					if((trace.createdAt.getTime() - dateDisconnection) > 0) newActions++;
				}
			})

			socket.emit("notifications", {newActions, newTrace})
		}
	}

	getStatusBox(socket) {
		socket.on("status", async ({codeBox}, callback) => {
			callback("got it");
			let lastTrace = null;

			if (codeBox.split("-")[0].toLowerCase() == "qaf") {
				try {
					lastTrace = await BoxTrace.findOne({
						where: {deleted: false},
						include: {
							model: Box,
							as: 'box',
							required: true,
							right: true,
							attributes: ["id_client", "id_stock"],
							where: { code_box: codeBox }
						},
						order: [["createdAt", "DESC"]],
						limit: 1
					})
				} catch (e) {
					console.log(e)
				}

				console.log("lastTrace ", lastTrace)

				const dataTrace = lastTrace ? {...lastTrace.dataValues, id_client: lastTrace.dataValues.box.id_client} : {}

				console.log("dataTrace ", dataTrace)
				socket.emit("statusBox", dataTrace)

			} else if (codeBox.split("-")[0].toLowerCase() === "env") {
				try {
					lastTrace = await DB.query(`
						SELECT box.id AS 'id_box', box.code_box, box.code_envelope, box.id_client, box.id_stock, box_trace.id, box_trace.status
						FROM boxes box
						INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
						WHERE box.code_envelope = "${codeBox}"
						AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1 )
					`, {type: QueryTypes.SELECT});

				} catch (e) {
					console.log(e)
				}
				const dataTrace = lastTrace ? lastTrace : []
				console.log("dataTrace", dataTrace)
				socket.emit("statusBox", dataTrace)
			} else if (codeBox.split("-")[0].toLowerCase() === "pic") {
				try {
					lastTrace = await DB.query(`
						SELECT box.id AS 'id_box', box.code_box, box.code_pick_up, box.id_client, box.id_stock, box_trace.id, box_trace.status
						FROM boxes box
						INNER JOIN box_traces AS box_trace ON box_trace.id_box = box.id
						WHERE box.code_pick_up = "${codeBox}"
						AND box_trace.id = ( SELECT id FROM box_traces WHERE id_box = box.id ORDER BY createdAt DESC LIMIT 1 )
					`, {type: QueryTypes.SELECT});

				} catch (e) {
					console.log(e)
				}
				//
				const dataTrace = lastTrace ? lastTrace : []
				console.log("dataTrace", dataTrace)
				socket.emit("statusBox", dataTrace)
			}
		})
	}

	socketError(socket) {
		socket.on("error", (err) => {
			console.log("error", err)
			if (err && err.message === UNAUTHORIZED) {
				socket.disconnect();
			}
			if (err && err.message === "date config empty") {
				socket.disconnect();
			}
		})
	}

	socketDisconnect(socket) {
		socket.on('disconnect',(data)=>{
			const nowDate = new Date();
			const dateDisconnect = dateFormat(nowDate, "yyyy-MM-dd HH:mm:ss");

			if (socket.id.split("_")[1] != "undefined") {
				User.update({lastDisconnection: dateDisconnect}, {
					where: { id:  socket.id.split("_")[1] }
				})
			}
			console.info(`${dateDisconnect}  | visitor ${socket.id} disconnected 🖐🖐🖐`);
			this.online_users = this.online_users.filter(user => user != socket.id);
		});
	}

	socketPacketCreate(socket) {
		socket.conn.on("packetCreate", ({ type, data }) => {
			console.log("packetCreate");
			console.log({ type, data });
		});
	}

	socketPacket(socket) {
		socket.conn.on("packet", ({ type, data }) => {
			console.log("packet");
			console.log({ type, data });
		});
	}

	socketUpgrade(socket) {
		socket.conn.once("upgrade", () => {
			console.log("upgraded transport", socket.conn.transport.name);
		});
	}
}