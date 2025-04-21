
export interface SavedAddress {
  id: string;
  address: string;
  createdAt: string;
  isLmiEligible?: boolean;
  notes?: string;
}

export interface SaveAddressInput {
  address: string;
  isLmiEligible?: boolean;
  notes?: string;
}
