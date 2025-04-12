
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    RAISE NOTICE 'Creating table users';
  END IF;
END
$$;
  

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services') THEN
    RAISE NOTICE 'Creating table services';
  END IF;
END
$$;
  

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
    RAISE NOTICE 'Creating table customers';
  END IF;
END
$$;
  

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'appointments') THEN
    RAISE NOTICE 'Creating table appointments';
  END IF;
END
$$;
  

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
    RAISE NOTICE 'Creating table payments';
  END IF;
END
$$;
  

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    RAISE NOTICE 'Creating table products';
  END IF;
END
$$;
  

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_variants') THEN
    RAISE NOTICE 'Creating table product_variants';
  END IF;
END
$$;
  

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'carts') THEN
    RAISE NOTICE 'Creating table carts';
  END IF;
END
$$;
  

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cart_items') THEN
    RAISE NOTICE 'Creating table cart_items';
  END IF;
END
$$;
  