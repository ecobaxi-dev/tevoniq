/** Owner-supplied category names. These are inactive editorial records, not advertised offerings. */
export const initialServiceNames = [
  'Artificial Intelligence',
  'Cloud Solutions',
  'Cybersecurity',
  'System Integration',
  'Custom Software Development',
  'Web Development',
  'Mobile Application Development',
  'E-Commerce Solutions',
  'Managed IT Services',
  'IT Consulting',
  'Network Infrastructure',
  'Data Center Solutions',
  'Servers & Storage',
  'Backup & Disaster Recovery',
  'ERP Solutions',
  'CRM Solutions',
  'Business Automation',
  'API Integration',
  'DevOps',
  'Database Solutions',
  'IoT Solutions',
  'Smart Systems',
  'CCTV',
  'Video Surveillance',
  'Access Control',
  'Biometric Systems',
  'Fire & Life Safety',
  'Digital Signage',
  'Video Conferencing',
  'Audiovisual Systems',
  'Interactive Displays',
  'POS Systems',
  'Queue Management Systems',
  'Archiving Solutions',
  'Barcode Solutions',
];
export const categorySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
