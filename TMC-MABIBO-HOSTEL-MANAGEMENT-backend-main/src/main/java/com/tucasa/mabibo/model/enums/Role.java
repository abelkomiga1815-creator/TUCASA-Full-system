package com.tucasa.mabibo.model.enums;

/**
 * Role hierarchy: LEADER and ADMIN are also MEMBERS - they still must
 * perform semester updates. Hierarchy is enforced in the service/security
 * layer (hasAnyAuthority checks), not by inheritance in this enum.
 */
public enum Role {
    MEMBER,
    LEADER,
    ADMIN
}
