import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
  migrations: [
    {
      toVersion: 6,
      steps: [
        addColumns({
          table: 'loba_posts',
          columns: [
            { name: 'filter_color', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        createTable({
          name: 'loba_friends',
          columns: [
            { name: 'friend_id', type: 'string', isIndexed: true },
            { name: 'name', type: 'string' },
            { name: 'username', type: 'string', isIndexed: true },
            { name: 'phone', type: 'string', isIndexed: true },
            { name: 'avatar', type: 'string', isOptional: true },
            { name: 'status', type: 'string' },
            { name: 'last_seen', type: 'number' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'addresses',
          columns: [
            { name: 'city', type: 'string', isOptional: true },
            { name: 'city_code', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: 'products',
          columns: [
            { name: 'name', type: 'string' },
            { name: 'brand', type: 'string' },
            { name: 'price', type: 'string' },
            { name: 'category', type: 'string', isIndexed: true },
            { name: 'is_new', type: 'boolean' },
            { name: 'image_url', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'wallet_transactions',
          columns: [
            { name: 'title', type: 'string' },
            { name: 'meta', type: 'string' },
            { name: 'amount', type: 'string' },
            { name: 'is_positive', type: 'boolean' },
            { name: 'wallet_mode', type: 'string', isIndexed: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'loba_posts',
          columns: [
            { name: 'username', type: 'string' },
            { name: 'avatar', type: 'string', isOptional: true },
            { name: 'content', type: 'string' },
            { name: 'image_url', type: 'string', isOptional: true },
            { name: 'video_url', type: 'string', isOptional: true },
            { name: 'likes', type: 'number' },
            { name: 'comments', type: 'number' },
            { name: 'is_liked', type: 'boolean' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'assistant_messages',
          columns: [
            { name: 'role', type: 'string' },
            { name: 'content', type: 'string' },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'addresses',
          columns: [
            { name: 'name', type: 'string' },
            { name: 'full_address', type: 'string', isOptional: true },
            { name: 'latitude', type: 'number' },
            { name: 'longitude', type: 'number' },
            { name: 'unique_id', type: 'string', isIndexed: true },
            { name: 'qr_payload', type: 'string' },
            { name: 'category', type: 'string' },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
  ],
})
