export {
  FREE_BOND_LIMIT,
  canAddBond,
  createBondApi,
} from "@/lib/bonds/api";
export type {
  BondApi,
  BondRecord,
  BondStore,
  CreateBondInput,
} from "@/lib/bonds/api";
export { localBondStore, createLocalBondStore } from "@/lib/bonds/local-store";
export {
  DOMAIN_LABELS,
  buildDomainDeepRead,
  domainIntensity,
  domainScoresList,
  isBondDomainId,
  softGateDomainRead,
} from "@/lib/bonds/domain-read";
export {
  bondKeys,
  useBondQuery,
  useBondUserId,
  useBondsQuery,
  useCanAddBond,
  useCreateBondMutation,
  useRemoveBondMutation,
} from "@/lib/bonds/queries";
export {
  BOND_DOMAINS,
  DOMAIN_RULE_CATALOG,
  computeSynastry,
  toSynastryCachePayload,
} from "@/lib/bonds/synastry";
export type {
  BondDomainId,
  DomainScore,
  SynastryAspect,
  SynastryCachePayload,
  SynastryReport,
} from "@/lib/bonds/synastry";
