import fs from 'fs';
import models from '../models';
import { Op } from "sequelize";
const store = process.env.STORE_LINK;

const createProductsSitemapByCateogory = (products, category) => {
    let urlProducts = '';

    for (const product of products) {
        urlProducts += `<url><loc>${store}/product?prod=${product.productoPadreId}&sku=${product.skuId}</loc></url>\n`;
    }

    const sitemapData = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n        
        ${urlProducts}
    </urlset>`;

    fs.writeFile(`sitemap/${category}.xml`, sitemapData, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });
};

const createCategoriesSiteMap = (categories) => {
    let urlCategories = '';
    let urlCategoriesProducts = '';

    for (const name of categories) {
        urlCategories += `<url> <loc>${store}/categorias/${name}</loc></url>\n`;
    }

    for (const name of categories) {
        urlCategoriesProducts += `<sitemap><loc>${store}/sitemap/${name}.xml</loc></sitemap>\n`;
    }

    const sitemapData = `
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url> <loc>${store}/conekta</loc> </url>
            <url> <loc>${store}/checkout</loc> </url>
            <url> <loc>${store}/faq</loc> </url>
            <url> <loc>${store}/quotes</loc> </url>
            <url> <loc>${store}/institucional</loc> </url>
            <url> <loc>${store}/quickShop</loc> </url>
            <url> <loc>${store}/advancedSearch</loc> </url>
            <url> <loc>${store}/advancedSearchForm</loc> </url>
            <url> <loc>${store}/search</loc> </url>
            <url> <loc>${store}/category</loc> </url>
            <url> <loc>${store}/product</loc> </url>
            <url> <loc>${store}/myprofile</loc> </url>
            <url> <loc>${store}/creditrequest</loc> </url>
            <url> <loc>${store}/contact</loc> </url>
            <url> <loc>${store}/register</loc> </url>
            <url> <loc>${store}/recovery</loc> </url>
            <url> <loc>${store}/login</loc> </url>\n
            ${urlCategories}\n
            ${urlCategoriesProducts}\n            
        </sitemapindex>`;

    fs.writeFile('sitemap.xml', sitemapData, function (err) {
        if (err) throw err;
        console.log('Sitemap products and categories created successfully.');
    });
};


export default {
    createSiteMap: async (req, res, next) => {
        let productsData = [];
        const categories = await models.Categoria.findAll(
            {
                where: {
                    cat_cmm_estatus_id: 1000010,
                    cat_categoria_link: {
                        [Op.ne]: null,
                    }
                },
                attributes: {exclude: ['createdAt', 'updatedAt']}
            }
        );

        const categoriesData = categories.map((item) => item.cat_categoria_link);
        createCategoriesSiteMap(categoriesData);
        
        for (const category of categories) {
            const productsByCategory = await models.Producto.findAll(
                {
                    where: {
                        prod_cat_categoria_id: category.cat_categoria_id,
                        prod_cmm_estatus_id: 1000016
                    },
                    attributes: {exclude: ['createdAt', 'updatedAt']}
                }
            ); 
            for (const mainProduct of productsByCategory) {
                const childProducts = await models.Producto.findAll(
                    {
                        where: {
                            prod_prod_producto_padre_sku: mainProduct.prod_sku,
                            prod_cmm_estatus_id: 1000016
                        },
                        attributes: {exclude: ['createdAt', 'updatedAt']}
                    }
                );                
                for (const childProduct of childProducts) {
                    productsData.push({                        
                        skuId: childProduct.prod_producto_id,
                        productoPadreId: mainProduct.prod_producto_id,
                        productoPadreSku: childProduct.prod_prod_producto_padre_sku,
                        categoriaProductoPadre: mainProduct.prod_cat_categoria_id,
                        categoryName: category.cat_categoria_link                   
                    })
                }
            }
            const filteredProducts = productsData.filter((product) => product.categoryName === category.cat_categoria_link);
            createProductsSitemapByCateogory(filteredProducts, category.cat_categoria_link)       
        }
        res.status(200).send({
            message: 'Sitemap created successfully.'
        });
    },
}