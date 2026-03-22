package com.itsm.backend.repository;

import com.itsm.backend.domain.Role;
import com.itsm.backend.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE " +
            "(:username IS NULL OR :username = '' OR u.username LIKE %:username%) AND " +
            "(:name IS NULL OR :name = '' OR u.name LIKE %:name%) AND " +
            "(:department IS NULL OR :department = '' OR u.department LIKE %:department%) AND " +
            "(:role IS NULL OR u.role = :role)")
    Page<User> searchUsers(@Param("username") String username, @Param("name") String name,
                           @Param("department") String department, @Param("role") Role role, Pageable pageable);
}