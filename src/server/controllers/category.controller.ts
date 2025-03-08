import { Context } from 'hono';
import { CategoryRepository } from '../repositories/category.repository';
import { ProductRepository } from '../repositories/product.repository';

// Initialize repositories for categories and products
const categoryRepo = new CategoryRepository();
const productRepo = new ProductRepository();

export class CategoryController {
  // Retrieve all categories
  async getAllCategories(c: Context) {
    try {
      console.log("Attempting to fetch all categories");
      const categories = await categoryRepo.findAll();
      console.log("Categories fetched:", categories);
      return c.json(categories, 200);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return c.json({ error: 'Failed to fetch categories' }, 500);
    }
  }

  // Retrieve a single category by its ID
  async getCategoryById(c: Context) {
    try {
      const id = parseInt(c.req.param('id')); // Parse the ID from the request parameters
      const category = await categoryRepo.findById(id);
      
      if (!category) {
        return c.json({ error: 'Category not found' }, 404);
      }
      
      return c.json(category, 200);
    } catch (error) {
      console.error('Error fetching category:', error);
      return c.json({ error: 'Failed to fetch category' }, 500);
    }
  }

  // Create a new category
  async createCategory(c: Context) {
    try {
      const body = await c.req.json(); // Extract data from request body
      const newCategory = await categoryRepo.create(body); // Create category in the repository
      return c.json(newCategory, 201);
    } catch (error) {
      console.error('Error creating category:', error);
      return c.json({ error: 'Failed to create category' }, 500);
    }
  }

  // Update an existing category by its ID
  async updateCategory(c: Context) {
    try {
      const id = parseInt(c.req.param('id')); // Parse category ID from request parameters
      const body = await c.req.json(); // Extract update data from request body
      const updatedCategory = await categoryRepo.update(id, body);
      
      if (!updatedCategory) {
        return c.json({ error: 'Category not found' }, 404);
      }
      
      return c.json(updatedCategory, 200);
    } catch (error) {
      console.error('Error updating category:', error);
      return c.json({ error: 'Failed to update category' }, 500);
    }
  }

  // Delete a category by its ID
  async deleteCategory(c: Context) {
    try {
      const id = parseInt(c.req.param('id')); // Parse category ID from request parameters
      const success = await categoryRepo.delete(id); // Attempt to delete category
      
      if (!success) {
        return c.json({ error: 'Category not found' }, 404);
      }
      
      // Return 204 No Content if deletion is successful
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error('Error deleting category:', error);
      return c.json({ error: 'Failed to delete category' }, 500);
    }
  }

  // Retrieve all products that belong to a specific category
  async getCategoryProducts(c: Context) {
    try {
      const categoryId = parseInt(c.req.param('id')); // Parse category ID from request parameters
      const category = await categoryRepo.findById(categoryId); // Check if the category exists
      
      if (!category) {
        return c.json({ error: 'Category not found' }, 404);
      }
      
      const products = await productRepo.findByCategoryId(categoryId); // Retrieve products by category ID
      return c.json(products, 200);
    } catch (error) {
      console.error('Error fetching category products:', error);
      return c.json({ error: 'Failed to fetch category products' }, 500);
    }
  }
}
