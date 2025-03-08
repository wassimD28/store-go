import { db } from '../../lib/db/db';
import { appProducts, type AppProduct, type NewAppProduct } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

export class ProductRepository {
  async findAll(): Promise<AppProduct[]> {
    return await db.select().from(appProducts);
  }

  async findById(id: number): Promise<AppProduct | null> {
    const result = await db.select().from(appProducts).where(eq(appProducts.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async findByCategoryId(categoryId: number): Promise<AppProduct[]> {
    return await db.select()
      .from(appProducts)
      .where(eq(appProducts.category_id, categoryId));
  }

  async create(product: NewAppProduct): Promise<AppProduct> {
    const result = await db.insert(appProducts).values(product).returning();
    return result[0];
  }

  async update(id: number, product: Partial<NewAppProduct>): Promise<AppProduct | null> {
    const result = await db
      .update(appProducts)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(appProducts.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(appProducts).where(eq(appProducts.id, id)).returning();
    return result.length > 0;
  }
}