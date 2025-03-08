import { Context } from 'hono';
import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';

const productRepo = new ProductRepository();
const categoryRepo = new CategoryRepository();

export class ProductController {
  async getAllProducts(c: Context) {
    try {
      const products = await productRepo.findAll();
      return c.json(products, 200);
    } catch (error) {
      console.error('Error fetching products:', error);
      return c.json({ error: 'Failed to fetch products' }, 500);
    }
  }

  async getProductById(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      const product = await productRepo.findById(id);
      
      if (!product) {
        return c.json({ error: 'Product not found' }, 404);
      }
      
      return c.json(product, 200);
    } catch (error) {
      console.error('Error fetching product:', error);
      return c.json({ error: 'Failed to fetch product' }, 500);
    }
  }

  async createProduct(c: Context) {
    try {
      const body = await c.req.json();
      
      // Validate category exists if category_id is provided
      if (body.category_id) {
        const category = await categoryRepo.findById(body.category_id);
        if (!category) {
          return c.json({ error: 'Category not found' }, 404);
        }
      }
      
      const newProduct = await productRepo.create(body);
      return c.json(newProduct, 201);
    } catch (error) {
      console.error('Error creating product:', error);
      return c.json({ error: 'Failed to create product' }, 500);
    }
  }

  async updateProduct(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      const body = await c.req.json();
      
      // Validate category exists if category_id is being updated
      if (body.category_id) {
        const category = await categoryRepo.findById(body.category_id);
        if (!category) {
          return c.json({ error: 'Category not found' }, 404);
        }
      }
      
      const updatedProduct = await productRepo.update(id, body);
      
      if (!updatedProduct) {
        return c.json({ error: 'Product not found' }, 404);
      }
      
      return c.json(updatedProduct, 200);
    } catch (error) {
      console.error('Error updating product:', error);
      return c.json({ error: 'Failed to update product' }, 500);
    }
  }

  async deleteProduct(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      const success = await productRepo.delete(id);
      
      if (!success) {
        return c.json({ error: 'Product not found' }, 404);
      }
      
      // Fixed return for 204 status
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('Error deleting product:', error);
      return c.json({ error: 'Failed to delete product' }, 500);
    }
  }
}