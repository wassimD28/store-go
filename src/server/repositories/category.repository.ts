
import { db } from '../../lib/db/db';
import { appCategories, type AppCategory, type NewAppCategory } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

export class CategoryRepository {
  /**
   * Retrieves all categories from the database.
   * @returns {Promise<AppCategory[]>} - A promise that resolves to an array of all categories.
   */
  async findAll(): Promise<AppCategory[]> {
    return await db.select().from(appCategories);
  }

  /**
   * Finds a category by its ID.
   * @param {number} id - The ID of the category to find.
   * @returns {Promise<AppCategory | null>} - A promise that resolves to the category if found, otherwise null.
   */
  async findById(id: number): Promise<AppCategory | null> {
    const result = await db.select().from(appCategories).where(eq(appCategories.id, id));
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Creates a new category in the database.
   * @param {NewAppCategory} category - The category data to insert.
   * @returns {Promise<AppCategory>} - A promise that resolves to the newly created category.
   */
  async create(category: NewAppCategory): Promise<AppCategory> {
    const result = await db.insert(appCategories).values(category).returning();
    return result[0]; // Returning the created category
  }

  /**
   * Updates an existing category by its ID.
   * @param {number} id - The ID of the category to update.
   * @param {Partial<NewAppCategory>} category - The updated category data.
   * @returns {Promise<AppCategory | null>} - A promise that resolves to the updated category, or null if not found.
   */
  async update(id: number, category: Partial<NewAppCategory>): Promise<AppCategory | null> {
    const result = await db
      .update(appCategories)
      .set({ ...category, updatedAt: new Date() }) // Update category data and set the updated timestamp
      .where(eq(appCategories.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : null; // Return updated category or null if not found
  }

  /**
   * Deletes a category by its ID.
   * @param {number} id - The ID of the category to delete.
   * @returns {Promise<boolean>} - A promise that resolves to true if the category was deleted, false otherwise.
   */
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(appCategories).where(eq(appCategories.id, id)).returning();
    return result.length > 0; // Return true if at least one category was deleted
  }
}
