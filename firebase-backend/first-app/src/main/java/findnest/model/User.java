package findnest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private String id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String password;
    private String profilePicture;
    private String username;
    private String department;
    private String role;
    private String createdAt;
    private String updatedAt;
}