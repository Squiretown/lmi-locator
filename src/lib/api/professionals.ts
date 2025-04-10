
// This file now re-exports from the refactored modules
export { 
  Professional, 
  ProfessionalFormValues 
} from './types';

export { 
  fetchProfessionals,
  fetchProfessionalById,
  getProfessionalByUserId,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  getPermissionsForProfessional,
  addPermissionToProfessional,
  removePermissionFromProfessional
} from './professionals';
