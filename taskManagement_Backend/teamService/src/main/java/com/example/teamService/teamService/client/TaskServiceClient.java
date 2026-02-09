package com.example.teamService.teamService.client;

import com.example.teamService.teamService.dto.MemberTaskStats;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "task-service")
public interface TaskServiceClient {

    @PostMapping("/tasks/member-stats")
    List<MemberTaskStats> getMemberStats(@RequestBody List<Long> projectIds);
}
