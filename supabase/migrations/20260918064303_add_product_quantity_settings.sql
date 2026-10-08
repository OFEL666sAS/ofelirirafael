/*
# Add per-product quantity settings

1. Modified Tables
- `products`
- `min_quantity` (integer, not null, default 1): cantidad mínima e inicial permitida por pedido.
- `max_quantity` (integer, nullable): cantidad máxima por pedido / stock disponible tope. NULL = sin tope fijo.
- `allow_manual_quantity` (boolean, not null, default false): si el cliente puede escribir la cantidad directamente con el teclado.

2. Constraints
- `min_quantity` debe ser >= 1.
- `max_quantity`, cuando está definido, debe ser >= `min_quantity`.

3. Security
- No changes to RLS. Existing product policies (public read, authenticated write) continue to apply.

4. Notes
1. Los productos existentes conservan su comportamiento actual: mínimo 1 y sin escritura manual, salvo que se configure lo contrario desde el panel.
2. Estos valores se guardan por producto.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'min_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN min_quantity integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'max_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN max_quantity integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'allow_manual_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN allow_manual_quantity boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products' AND constraint_name = 'products_min_quantity_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_min_quantity_check CHECK (min_quantity >= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'products' AND constraint_name = 'products_max_quantity_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_max_quantity_check CHECK (max_quantity IS NULL OR max_quantity >= min_quantity);
  END IF;
END $$;
