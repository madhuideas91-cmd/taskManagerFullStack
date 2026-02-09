package com.example.teamService.teamService.client;

import com.example.teamService.teamService.config.ProjectFeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(
        name = "project-service"
//        configuration = ProjectFeignConfig.class
)
//@FeignClient(name = "project-service")
public interface ProjectClient {

    @GetMapping("/projects/team/{teamId}/project-ids")
    List<Long> getProjectIdsByTeam(@PathVariable("teamId") Long teamId);
}
