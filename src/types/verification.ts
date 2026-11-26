// Provisional contract until the backend publishes the public verification endpoint (REQ-50 to REQ-52).
export type VerificationStatus = 'valid' | 'tampered' | 'not_found';
export type VerificationResponse = {
  status: VerificationStatus;
  signer?: string;
  signedAt?: string;
  signatureId?: string;
  documentHash?: string;
};
