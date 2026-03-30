import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
  migrations: [
    {
      toVersion: 8,
      steps: [
        addColumns({
          table: 'loba_posts',
          columns: [
            { name: 'hash', type: 'string', isIndexed: true },
            { name: 'local_media_path', type: 'string', isOptional: true },
            { name: 'category', type: 'string', isIndexed: true },
            { name: 'size', type: 'number' },
            { name: 'is_propagating', type: 'boolean' },
            { name: 'downloaded_at', type: 'number', isOptional: true },
          ],
        }),
        createTable({
          name: 'user_interests',
          columns: [
            { name: 'service', type: 'string', isIndexed: true },
            { name: 'category', type: 'string', isIndexed: true },
            { name: 'weight', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 7,
      steps: [
        addColumns({
          table: 'products',
          columns: [
            { name: 'description', type: 'string' },
            { name: 'min_price', type: 'string' },
            { name: 'stock', type: 'number' },
            { name: 'photos_json', type: 'string' },
            { name: 'condition', type: 'string' },
            { name: 'colors_json', type: 'string' },
            { name: 'sizes_json', type: 'string' },
            { name: 'tags_json', type: 'string' },
            { name: 'seller_id', type: 'string', isIndexed: true },
            { name: 'seller_name', type: 'string' },
            { name: 'is_validated', type: 'boolean' },
            { name: 'validated_by', type: 'string', isOptional: true },
            { name: 'product_sync_status', type: 'string', isIndexed: true },
          ],
        }),
      ],
    },
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
