package com.tucasa.mabibo.service;

import com.tucasa.mabibo.repository.UserRepository;

import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MemberExportService {

    private final UserRepository userRepository;

    public MemberExportService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public byte[] exportMembers(List<Long> memberIds) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Members");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "First Name", "Middle Name", "Last Name", "Email",
                "Phone", "University", "Program", "Year of Study", "Baptized",
                "Role", "Status", "Branch ID", "Branch Name", "Talent",
                "Profile Picture URL", "Created At"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Fetch selected members
            List<User> members = memberIds.stream()
                    .map(userRepository::findById)
                    .filter(java.util.Optional::isPresent)
                    .map(java.util.Optional::get)
                    .collect(Collectors.toList());

            // Write member data rows
            for (int i = 0; i < members.size(); i++) {
                User user = members.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(user.getId());
                row.createCell(1).setCellValue(user.getFirstName());
                row.createCell(2).setCellValue(user.getMiddleName());
                row.createCell(3).setCellValue(user.getLastName());
                row.createCell(4).setCellValue(user.getEmail());
                row.createCell(5).setCellValue(user.getPhone());
                row.createCell(6).setCellValue(user.getUniversity());
                row.createCell(7).setCellValue(user.getProgram());
                row.createCell(8).setCellValue(user.getYearOfStudy());
                row.createCell(9).setCellValue(user.getIsBaptized() != null && user.getIsBaptized());
                row.createCell(10).setCellValue(user.getRole() != null ? user.getRole().name() : "");
                row.createCell(11).setCellValue(user.getStatus() != null ? user.getStatus().name() : "");
                row.createCell(12).setCellValue(user.getBranch() != null ? user.getBranch().getId() : null);
                row.createCell(13).setCellValue(user.getBranch() != null ? user.getBranch().getName() : "");
                row.createCell(14).setCellValue(user.getTalent());
                row.createCell(15).setCellValue(user.getProfilePicUrl());
                row.createCell(16).setCellValue(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
            }

            workbook.write(outputStream);
        }
        return outputStream.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] exportAllMembers(Short branchId) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("All Members");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "First Name", "Middle Name", "Last Name", "Email",
                "Phone", "University", "Program", "Year of Study", "Baptized",
                "Role", "Status", "Branch ID", "Branch Name", "Talent",
                "Profile Picture URL", "Created At"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Fetch all members for the branch
            List<User> members = userRepository.findByBranchIdOrderByCreatedAtDesc(branchId);

            // Write member data rows
            for (int i = 0; i < members.size(); i++) {
                User user = members.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(user.getId());
                row.createCell(1).setCellValue(user.getFirstName());
                row.createCell(2).setCellValue(user.getMiddleName());
                row.createCell(3).setCellValue(user.getLastName());
                row.createCell(4).setCellValue(user.getEmail());
                row.createCell(5).setCellValue(user.getPhone());
                row.createCell(6).setCellValue(user.getUniversity());
                row.createCell(7).setCellValue(user.getProgram());
                row.createCell(8).setCellValue(user.getYearOfStudy());
                row.createCell(9).setCellValue(user.getIsBaptized() != null && user.getIsBaptized());
                row.createCell(10).setCellValue(user.getRole() != null ? user.getRole().name() : "");
                row.createCell(11).setCellValue(user.getStatus() != null ? user.getStatus().name() : "");
                row.createCell(12).setCellValue(user.getBranch() != null ? user.getBranch().getId() : null);
                row.createCell(13).setCellValue(user.getBranch() != null ? user.getBranch().getName() : "");
                row.createCell(14).setCellValue(user.getTalent());
                row.createCell(15).setCellValue(user.getProfilePicUrl());
                row.createCell(16).setCellValue(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
            }

            workbook.write(outputStream);
        }
        return outputStream.toByteArray();
    }
}