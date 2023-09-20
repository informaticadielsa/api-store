import cron from "node-cron";
import config from '../config';
import integrations from "./Integraciones"


console.log('Integracion sap')

//actualizar ordenes cada 2 minutos
cron.schedule("*/2 * * * *", () =>{integrations.ExecuteEndpoint("/api/integraciones_info_transfer/IntegracionActualizarOrdenes/")});


