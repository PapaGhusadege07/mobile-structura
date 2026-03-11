
-- Create regions table
CREATE TABLE public.regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create region_pricing table
CREATE TABLE public.region_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(region_id, service_name)
);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_pricing ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Anyone can view pricing" ON public.region_pricing FOR SELECT USING (true);

-- Write access
CREATE POLICY "Anyone can insert regions" ON public.regions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update regions" ON public.regions FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert pricing" ON public.region_pricing FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pricing" ON public.region_pricing FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pricing" ON public.region_pricing FOR DELETE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_region_pricing_updated_at
  BEFORE UPDATE ON public.region_pricing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed regions
INSERT INTO public.regions (city, state) VALUES
  ('Mumbai', 'Maharashtra'),
  ('Bangalore', 'Karnataka'),
  ('Delhi', 'Delhi'),
  ('Chennai', 'Tamil Nadu'),
  ('Hyderabad', 'Telangana'),
  ('Pune', 'Maharashtra');

-- Seed pricing for Mumbai
INSERT INTO public.region_pricing (region_id, service_name, price, description)
SELECT r.id, s.service_name, s.price, s.description
FROM public.regions r
CROSS JOIN (VALUES
  ('Basic Service', 500, 'Standard construction consultation'),
  ('Premium Service', 1200, 'Full-service project management'),
  ('Site Inspection', 800, 'Comprehensive site analysis'),
  ('Structural Design', 2500, 'Detailed structural planning'),
  ('Cost Estimation', 600, 'Project cost breakdown report'),
  ('Material Sourcing', 1500, 'End-to-end material procurement')
) AS s(service_name, price, description)
WHERE r.city = 'Mumbai';

-- Seed pricing for Bangalore
INSERT INTO public.region_pricing (region_id, service_name, price, description)
SELECT r.id, s.service_name, s.price, s.description
FROM public.regions r
CROSS JOIN (VALUES
  ('Basic Service', 450, 'Standard construction consultation'),
  ('Premium Service', 1100, 'Full-service project management'),
  ('Site Inspection', 750, 'Comprehensive site analysis'),
  ('Structural Design', 2300, 'Detailed structural planning'),
  ('Cost Estimation', 550, 'Project cost breakdown report'),
  ('Material Sourcing', 1400, 'End-to-end material procurement')
) AS s(service_name, price, description)
WHERE r.city = 'Bangalore';

-- Seed pricing for Delhi
INSERT INTO public.region_pricing (region_id, service_name, price, description)
SELECT r.id, s.service_name, s.price, s.description
FROM public.regions r
CROSS JOIN (VALUES
  ('Basic Service', 480, 'Standard construction consultation'),
  ('Premium Service', 1150, 'Full-service project management'),
  ('Site Inspection', 780, 'Comprehensive site analysis'),
  ('Structural Design', 2400, 'Detailed structural planning'),
  ('Cost Estimation', 580, 'Project cost breakdown report'),
  ('Material Sourcing', 1450, 'End-to-end material procurement')
) AS s(service_name, price, description)
WHERE r.city = 'Delhi';

-- Seed pricing for Chennai
INSERT INTO public.region_pricing (region_id, service_name, price, description)
SELECT r.id, s.service_name, s.price, s.description
FROM public.regions r
CROSS JOIN (VALUES
  ('Basic Service', 420, 'Standard construction consultation'),
  ('Premium Service', 1050, 'Full-service project management'),
  ('Site Inspection', 700, 'Comprehensive site analysis'),
  ('Structural Design', 2200, 'Detailed structural planning'),
  ('Cost Estimation', 520, 'Project cost breakdown report'),
  ('Material Sourcing', 1350, 'End-to-end material procurement')
) AS s(service_name, price, description)
WHERE r.city = 'Chennai';

-- Seed pricing for Hyderabad
INSERT INTO public.region_pricing (region_id, service_name, price, description)
SELECT r.id, s.service_name, s.price, s.description
FROM public.regions r
CROSS JOIN (VALUES
  ('Basic Service', 430, 'Standard construction consultation'),
  ('Premium Service', 1080, 'Full-service project management'),
  ('Site Inspection', 720, 'Comprehensive site analysis'),
  ('Structural Design', 2250, 'Detailed structural planning'),
  ('Cost Estimation', 540, 'Project cost breakdown report'),
  ('Material Sourcing', 1380, 'End-to-end material procurement')
) AS s(service_name, price, description)
WHERE r.city = 'Hyderabad';

-- Seed pricing for Pune
INSERT INTO public.region_pricing (region_id, service_name, price, description)
SELECT r.id, s.service_name, s.price, s.description
FROM public.regions r
CROSS JOIN (VALUES
  ('Basic Service', 460, 'Standard construction consultation'),
  ('Premium Service', 1120, 'Full-service project management'),
  ('Site Inspection', 760, 'Comprehensive site analysis'),
  ('Structural Design', 2350, 'Detailed structural planning'),
  ('Cost Estimation', 560, 'Project cost breakdown report'),
  ('Material Sourcing', 1420, 'End-to-end material procurement')
) AS s(service_name, price, description)
WHERE r.city = 'Pune';
