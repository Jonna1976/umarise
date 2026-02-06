-- Maak de BEFORE INSERT trigger aan voor pages → origin_attestations bridge
-- De functie bestaat al, alleen de trigger ontbreekt

CREATE TRIGGER bridge_page_to_core
  BEFORE INSERT ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.bridge_page_to_core_attestation();