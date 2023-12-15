import Usuario from './UsuarioModel';
import ControlMaestroMultiple from './ControlMaestroMultipleModel';
import Rol from './RolModel';
import RolPermiso from './RolPermisoModel';
import Menu from './MenuModel';
import Categoria from './CategoriaModel';
import Atributo from './AtributoModel';
import AtributoProductos from './AtributosProductosModel';
import AtributoSkuValores from './AtributosSkuValoresModel';
import AtributoCategorias from './AtributosCategoriasModel';
import AtributoProductosValores from './AtributosProductosValoresModel';
import Producto from './ProductoModel';
import PrevisualizacionProductoCategoria from './PrevisualizacionProductoCategoriaModel';
import EquipoDeTrabajo from './EquipoDeTrabajoModel';
import UsuarioEquipoDeTrabajo from './UsuariosEquipoDeTrabajoModel';
import MetaEquipoTrabajo from './MetaEquipoTrabajoModel';
import MetaUsuario from './MetaUsuarioModel';
import Coleccion from './ColeccionModel';
import ListaPrecio from './ListaPrecioModel';
import ProductoColeccion from './ProductoColeccionModel';
import StockProducto from './StockProductoModel';
import Almacenes from './AlmacenesModel';
import Pais from './PaisModel';
import Estado from './EstadoModel';
import Marca from './MarcaModel';
import SociosNegocio from './SociosNegocioModel';
import SociosNegocioUsuario from './SociosNegocioUsuarioModel';
import SociosNegocioDirecciones from './SociosNegocioDireccionesModel';
import ImagenProducto from './ImagenProductoModel';
import CarritoDeCompra from './CarritoDeCompraModel';
import ProductoCarritoDeCompra from './ProductoCarritoDeCompraModel';
import PromocionDescuento from './PromocionesDescuentosModel';
import ElementoPromocion from './ElementosPromocionModel';
import ProductoPromocion from './ProductoPromocionModel';
import UsuariosSociosDeNegocios from './UsuariosSociosDeNegocioModel';
import CompraFinalizada from './CompraFinalizadaModel';
import ProductoCompraFinalizada from './ProductoCompraFinalizadaModel';
import CotizacionProyecto from './CotizacionProyectoModel';
import ProductosCotizacionProyecto from './ProductosCotizacionProyectoModel';
import GerentesSocioNegocios from './GerentesSociosNegocioModel';
import ProductoListaPrecio from './ProductoListaPrecioModel';
import Facturas from './FacturasModel';
import Fleteras from './FleterasModel';
import VendedoresSap from './VendedoresSapModel';
import ProductoDataSheet from './ProductoDataSheetModel';
import OrdenDeCompra from './OrdenDeCompraModel';
import ArchivosDeInicio from './ArchivosDeInicioModel';
import PaginaInstitucional from './PaginaInstitucionalModel';

import RawSociosNegocios from './RawSociosNegociosModel';
import RawSociosNegociosDirecciones from './RawSociosNegociosDireccionesModel';
import RawSnPropiedades from './RawSnPropiedadesModel';
import RawSnGrupos from './RawSnGruposModel';
import RawArticulos from './RawArticulosModel';
import RawArticulosPropiedades from './RawArticulosPropiedadesModel';
import RawArticulosGrupos from './RawArticulosGruposModel';
import RawArticulosBom from './RawArticulosBomModel';
import RawArticulosBomComponentes from './RawArticulosBomComponentesModel';
import RawAlmacenes from './RawAlmacenesModel';
import RawInventario from './RawInventarioModel';
import RawNombreListasPrecios from './RawNombreListasPreciosModel';
import RawListasPreciosBasicas from './RawListasPreciosBasicasModel';
import RawListasPreciosPeriodo from './RawListasPreciosPeriodoModel';
import RawListasPreciosCantidad from './RawListasPreciosCantidadModel';
import RawListasPreciosGrupo from './RawListasPreciosGrupoModel';
import RawListasPreciosEspeciales from './RawListasPreciosEspecialesModel';
import RawInventarioDetalle from './RawInventarioDetalleModel';
import RawInventarioDetalleUbicacion from './RawInventarioDetalleUbicacionModel';
import SapMetodosPago from './SapMetodosPagoModel';
import SapFormasPago from './SapFormasPagoModel';
import ProductosKit from './ProductosKitModel';
import ProductosKitComponentes from './ProductosKitComponentesModel';
import Faqs from './FaqsModel';
import Banners from './BannersModel';
import Sliders from './SlidersModel';
import Proveedores from './ProveedoresModel';
import CodigosPostales from './CodigosPostalesModel';
import Cfdi from './CfdiModel';


import SolicitudDeCredito from './SolicitudDeCreditoModel';
import SucursalSolicitudDeCredito from './SucursalSolicitudDeCreditoModel';
import VehiculoSolicitudDeCredito from './VehiculoSolicitudDeCreditoModel';

import Contacto from './ContactoModel';
import WishList from './WishListModel';
import WishListProductos from './WishListProductosModel';
import ResenasProductos from './ResenasProductosModel';
import ConektaPagos from './ConektaPagosModel';
import ConektaPagosDevoluciones from './ConektaPagosDevolucionesModel';
import CompraFinalizadaGuia from './CompraFinalizadaGuiaModel';
import AlmacenesLogistica from './AlmacenesLogisticaModel';
import CiudadesEstados from './CiudadesEstadosModel';
import CiudadesEstadosCp from './CiudadesEstadosCpModel';
import Newsletter from './NewsletterModel';

import PoliticasEnvio from './PoliticasEnvioModel';
import PoliticasEnvioAlmacenes from './PoliticasEnvioAlmacenesModel';
import PoliticasEnvioData from './PoliticasEnvioDataModel';
import StockProductoDetalle from './StockProductoDetalleModel';

// v2
import PromocionCupones from './PromocionesCuponesModel';
import ElementosCupones from './ElementosCuponesModel';
import ProductoCupones from './ProductoCuponesModel';
import SociosNegocioDescuentos from './SociosNegocioDescuentos';

//Pre validador
import PreCompraFinalizada from './PreCompraFinalizadaModel';
import PreProductoCompraFinalizada from './PreProductoCompraFinalizadaModel';

//Cotizaciones
import Cotizaciones from './CotizacionesModel';
import CotizacionesProductos from './CotizacionesProductosModel';


import CompraFinalizadaSAPErrores from './CompraFinalizadaSAPErroresModel';

import SafeCarritoDeCompra from './SafeCarritoDeCompraModel';
import SafeProductoCarritoDeCompra from './SafeProductoCarritoDeCompraModel';

import UsuariosProspectos from './UsuariosProspectosModel';
import UsuariosProspectosDirecciones from './UsuariosProspectosDireccionesModel';

import Correos from './CorreosModel';

import Proyectos from './ProyectosModel';
import LineasProyectos from './LineasProyectosModel';
import ProyectoSolicitudes from './ProyectoSolicitudesModel';
import Registros from './RegistrosModel'
import Colecciones from './ColeccionesModel'
import ProductosColecciones from './ProductosColeccionesModel'
export default {
    Usuario,
    ControlMaestroMultiple,
    Rol,
    RolPermiso,
    Menu,
    Categoria,
    Atributo,
    AtributoProductos,
    AtributoSkuValores,
    AtributoCategorias,
    AtributoProductosValores,
    Producto,
    PrevisualizacionProductoCategoria,
    EquipoDeTrabajo,
    UsuarioEquipoDeTrabajo,
    MetaEquipoTrabajo,
    MetaUsuario,
    Coleccion,
    ProductoColeccion,
    ListaPrecio,
    StockProducto,
    Almacenes,
    Pais,
    Estado,
    Marca,
    SociosNegocio,
    SociosNegocioUsuario,
    SociosNegocioDirecciones,
    ImagenProducto,
    CarritoDeCompra,
    ProductoCarritoDeCompra,
    PromocionDescuento,
    ElementoPromocion,
    ProductoPromocion,
    UsuariosSociosDeNegocios,
    CompraFinalizada,
    ProductoCompraFinalizada,
    CotizacionProyecto,
    ProductosCotizacionProyecto,
    GerentesSocioNegocios,
    ProductoListaPrecio,
    RawSociosNegocios,
    RawSociosNegociosDirecciones,
    RawSnPropiedades,
    RawSnGrupos,
    RawArticulos,
    RawArticulosPropiedades,
    RawArticulosGrupos,
    RawArticulosBom,
    RawArticulosBomComponentes,
    RawAlmacenes,
    RawInventario,
    RawNombreListasPrecios,
    RawListasPreciosBasicas,
    RawListasPreciosPeriodo,
    RawListasPreciosCantidad,
    RawListasPreciosGrupo,
    RawListasPreciosEspeciales,
    RawInventarioDetalle,
    RawInventarioDetalleUbicacion,
    Facturas,
    Fleteras,
    VendedoresSap,
    ProductoListaPrecio,
    ProductoDataSheet,
    OrdenDeCompra,
    SapMetodosPago,
    SapFormasPago,
    ProductosKit,
    ProductosKitComponentes,
    Faqs,
    Banners,
    Sliders,
    Proveedores,
    CodigosPostales,
    Cfdi,
    ArchivosDeInicio,
    CodigosPostales,
    PaginaInstitucional,
    SolicitudDeCredito,
    SucursalSolicitudDeCredito,
    VehiculoSolicitudDeCredito,
    Contacto,
    WishList,
    WishListProductos,
    ResenasProductos,
    ConektaPagos,
    AlmacenesLogistica,
    PromocionCupones,
    ElementosCupones,
    ProductoCupones,
    CiudadesEstados,
    CiudadesEstadosCp,
    PoliticasEnvio,
    PoliticasEnvioAlmacenes,
    PoliticasEnvioData,
    PreCompraFinalizada,
    PreProductoCompraFinalizada,
    SociosNegocioDescuentos,
    Newsletter,
    Cotizaciones,
    CotizacionesProductos,
    StockProductoDetalle,
    CompraFinalizadaSAPErrores,
    SafeCarritoDeCompra,
    SafeProductoCarritoDeCompra,
    UsuariosProspectos,
    Correos,
    UsuariosProspectosDirecciones,
    ConektaPagosDevoluciones,
    Proyectos,
    LineasProyectos,
    ProyectoSolicitudes,
    Registros,
    Colecciones,
    ProductosColecciones
}