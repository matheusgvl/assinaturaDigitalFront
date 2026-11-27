// Contract implemented by the public backend verification endpoint.
export type VerificationStatus = 'valid' | 'tampered' | 'not_found';
export type VerificationResponse = {
  status: VerificationStatus;
  signer?: string;
  signedAt?: string;
  signatureId?: string;
  documentHash?: string;
};
