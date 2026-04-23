ALTER TABLE enfrentamientos
DROP CONSTRAINT IF EXISTS enfrentamientos_ronda_check;

ALTER TABLE enfrentamientos
ADD CONSTRAINT enfrentamientos_ronda_check
CHECK (
  ronda IN (
    'treintaidosavos',
    'dieciseisavos',
    'octavos',
    'cuartos',
    'semifinal',
    'final',
    'tercer_lugar'
  )
);
