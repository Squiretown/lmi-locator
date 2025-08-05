
// This file maintains backward compatibility with the old broker API by wrapping the new mortgage professionals API

import { 
  MortgageProfessional, 
  MortgageProfessionalFormValues,
  fetchMortgageProfessionals,
  createMortgageProfessional,
  updateMortgageProfessional,
  deleteMortgageProfessional,
  getMortgageProfessionalByUserId
} from './mortgage-professionals';

// Legacy broker types for backward compatibility
export interface MortgageBroker {
  id: string;
  name: string;
  company: string;
  license_number: string;
  email: string;
  phone: string | null;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
}

export interface BrokerFormValues {
  name: string;
  company: string;
  license_number: string;
  email: string;
  phone?: string;
  status: 'active' | 'pending' | 'inactive';
}

// Transform new MortgageProfessional to legacy MortgageBroker format
function transformToLegacyBroker(professional: MortgageProfessional): MortgageBroker {
  return {
    id: professional.id,
    name: professional.name,
    company: professional.company,
    license_number: professional.licenseNumber,
    email: professional.email || '',
    phone: professional.phone,
    status: professional.status,
    created_at: professional.createdAt
  };
}

// Transform legacy BrokerFormValues to new MortgageProfessionalFormValues
function transformToNewProfessionalForm(brokerForm: BrokerFormValues): MortgageProfessionalFormValues {
  return {
    name: brokerForm.name,
    company: brokerForm.company,
    licenseNumber: brokerForm.license_number,
    email: brokerForm.email,
    phone: brokerForm.phone,
    status: brokerForm.status
  };
}

// Backward-compatible API functions
export const fetchBrokers = async (): Promise<MortgageBroker[]> => {
  const professionals = await fetchMortgageProfessionals();
  return professionals.map(transformToLegacyBroker);
};

export const createBroker = async (broker: BrokerFormValues): Promise<MortgageBroker> => {
  const professional = await createMortgageProfessional(transformToNewProfessionalForm(broker));
  return transformToLegacyBroker(professional);
};

export const updateBroker = async (id: string, broker: BrokerFormValues): Promise<MortgageBroker> => {
  const professional = await updateMortgageProfessional(id, transformToNewProfessionalForm(broker));
  return transformToLegacyBroker(professional);
};

export const deleteBroker = async (id: string): Promise<void> => {
  return deleteMortgageProfessional(id);
};

export const getBrokerByUserId = async (): Promise<MortgageBroker | null> => {
  const professional = await getMortgageProfessionalByUserId();
  return professional ? transformToLegacyBroker(professional) : null;
};

// Legacy permission functions (to be implemented with new structure)
export const getBrokerPermissions = async (brokerId: string): Promise<string[]> => {
  // TODO: Implement with new professional_permissions table
  return [];
};

export const addPermissionToBroker = async (brokerId: string, permissionName: string): Promise<void> => {
  // TODO: Implement with new professional_permissions table
};

export const removePermissionFromBroker = async (brokerId: string, permissionName: string): Promise<void> => {
  // TODO: Implement with new professional_permissions table
};
