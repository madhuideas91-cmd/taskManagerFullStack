// src/pages/TeamPage.tsx
        import React, { useState, useEffect, useCallback } from "react";
        import Sidebar from "../components/Sidebar";
        import { FaUserCircle, FaEnvelope, FaSearch, FaTable, FaTh } from "react-icons/fa";
       import axiosInstance from "../api/axiosInstance";
        import { connectTeamSocket } from "../socket/teamSocket";

        interface MemberTaskStats {
          userId: number;
          open: number;
          inProgress: number;
          done: number;
        }

        interface Team {
          id: number;
          name: string;
        }

        interface TeamMember {
          userId: number;
          email: string;
          role: "ADMIN" | "MEMBER";
          status: "ACTIVE" | "INVITED";
          avatarUrl?: string;

          // ✅ coming from backend
          openTasks?: number;
          inProgressTasks?: number;
          doneTasks?: number;

          // ✅ UI already uses this
          tasks?: { open: number; inProgress: number; done: number };
        }


    const loggedInUserId = Number(localStorage.getItem("userId")); // ✅ FIX


        const TeamPage: React.FC = () => {
          const [teams, setTeams] = useState<Team[]>([]);
          const [selectedTeam, setSelectedTeam] = useState<Team | null>(
            JSON.parse(localStorage.getItem("selectedTeam") || "null")
          );
          const [members, setMembers] = useState<TeamMember[]>([]);
          const [inviteEmail, setInviteEmail] = useState("");
          const [inviting, setInviting] = useState(false);
          const [search, setSearch] = useState("");
          const [view, setView] = useState<"grid" | "table">("grid");


          // --- Fetch Teams ---
          const fetchTeams = useCallback(async () => {
            try {
              const res = await axiosInstance.get<Team[]>(`http://localhost:8080/api/teams/my-teams`, {
               //const res = await axiosInstance.get<Team[]>(`/teams/my-teams`, {
                params: { userId: loggedInUserId },
              });
              setTeams(res.data);
              if (!selectedTeam && res.data.length) {
                setSelectedTeam(res.data[0]);
                localStorage.setItem("selectedTeam", JSON.stringify(res.data[0]));
              }
            } catch (err: any) {
              console.error(err);
              alert("Failed to load teams.");
            }
          }, [selectedTeam]);

          // --- Fetch Members ---
          const fetchMembers = useCallback(async (teamId: number) => {
            try {
              const res = await axiosInstance.get<TeamMember[]>(
                  `http://localhost:8080/api/teams/${teamId}/members`
                //`/teams/${teamId}/members`
              );

              // ✅ Attach placeholder task stats (backend endpoint does NOT exist yet)
             const membersWithTasks: TeamMember[] = res.data.map((m) => ({
               ...m,
               tasks: {
                 open: m.openTasks ?? 0,
                 inProgress: m.inProgressTasks ?? 0,
                 done: m.doneTasks ?? 0,
               },
             }));

             setMembers(membersWithTasks);
            } catch (err) {
              console.error(err);
              alert("Failed to load members.");
            }
          }, []);


          useEffect(() => {
            fetchTeams();
          }, [fetchTeams]);

          useEffect(() => {
            if (selectedTeam) fetchMembers(selectedTeam.id);
          }, [selectedTeam, fetchMembers]);

          // --- Persist selected team ---
          const handleSelectTeam = (team: Team) => {
            setSelectedTeam(team);
            localStorage.setItem("selectedTeam", JSON.stringify(team));
          };

          // --- WebSocket Updates ---
          useEffect(() => {
            if (!selectedTeam) return;

            const client = connectTeamSocket(selectedTeam.id, () => {
              // Async code wrapped inside normal function
              const fetch = async () => {
                try {
                  await fetchMembers(selectedTeam.id);
                } catch (err) {
                  console.error("WebSocket update failed:", err);
                }
              };
              fetch();
            });

            // Cleanup on unmount or team change
            return () => {
              client.deactivate();
            };
          }, [selectedTeam, fetchMembers]);


          const currentUser = members.find((m) => m.userId === loggedInUserId);
          const isAdmin = currentUser?.role === "ADMIN";

          const filteredMembers = members.filter((m) => m.email.toLowerCase().includes(search.toLowerCase()));

          // --- Handlers ---
          const handleInvite = async () => {
            if (!inviteEmail || !selectedTeam) return;
            try {
              setInviting(true);
               await axiosInstance.put(`http://localhost:8080/api/teams/${selectedTeam.id}/invite`, null, {
               //await axiosInstance.put(`/teams/${selectedTeam.id}/invite`, null, {
                params: { email: inviteEmail, performedBy: loggedInUserId },
              });
              setInviteEmail("");
              fetchMembers(selectedTeam.id);
              alert("Invite sent!");
            } catch (err: any) {
              console.error(err);
              alert(err.response?.data?.message || "Failed to invite member.");
            } finally {
              setInviting(false);
            }
          };

          const handleChangeRole = async (member: TeamMember) => {
            if (!selectedTeam) return;
            const newRole = member.role === "ADMIN" ? "MEMBER" : "ADMIN";
            try {
              await axiosInstance.put(`http://localhost:8080/api/teams/${selectedTeam.id}/change-role`, null, {
               //await axiosInstance.put(`/teams/${selectedTeam.id}/change-role`, null, {
                params: { userId: member.userId, role: newRole, performedBy: loggedInUserId },
              });
              fetchMembers(selectedTeam.id);
              alert(`Role updated to ${newRole}`);
            } catch (err: any) {
              console.error(err);
              alert(err.response?.data?.message || "Failed to update role.");
            }
          };

          const handleRemove = async (member: TeamMember) => {
            if (!selectedTeam || !window.confirm(`Remove ${member.email}?`)) return;
            try {
              await axiosInstance.delete(`http://localhost:8080/api/teams/${selectedTeam.id}/remove-member`, {
               //await axiosInstance.delete(`/teams/${selectedTeam.id}/remove-member`, {
                params: { userId: member.userId, performedBy: loggedInUserId },
              });
              fetchMembers(selectedTeam.id);
              alert(`${member.email} removed.`);
            } catch (err: any) {
              console.error(err);
              alert(err.response?.data?.message || "Failed to remove member.");
            }
          };

          const handleAcceptInvite = async (member: TeamMember) => {
            if (!selectedTeam) return;
            try {
              await axiosInstance.put(`http://localhost:8080/api/teams/${selectedTeam.id}/accept`, null, {
              //await axiosInstance.put(`/teams/${selectedTeam.id}/accept`, null, {
                params: { userId: loggedInUserId },
              });
              fetchMembers(selectedTeam.id);
              alert("Invite accepted!");
            } catch (err: any) {
              console.error(err);
              alert(err.response?.data?.message || "Failed to accept invite.");
            }
          };

          const handleCreateTeam = async () => {
            const name = prompt("Enter team name");
            if (!name) return;

            try {
              const res = await axiosInstance.post<Team>(
                "http://localhost:8080/api/teams/create",
                //"/teams/create",
                null,
                {
                  params: {
                    name,
                    createdBy: loggedInUserId,
                  },
                }
              );

              setTeams((t) => [...t, res.data]);
              setSelectedTeam(res.data);
              localStorage.setItem("selectedTeam", JSON.stringify(res.data));
            } catch (err) {
              console.error(err);
              alert("Failed to create team");
            }
          };

          return (
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 p-6 md:p-8">
                <h1 className="text-2xl font-semibold mb-6">Teams</h1>

                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div className="flex gap-3 flex-wrap">
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => handleSelectTeam(team)}
                        className={`px-4 py-2 rounded-lg border ${
                          selectedTeam?.id === team.id ? "bg-blue-600 text-white" : "bg-white"
                        }`}
                      >
                        {team.name}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCreateTeam}
                    className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100"
                  >
                    + Create Team
                  </button>
                </div>

                {selectedTeam && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">
                        Members ({members.length})
                      </h2>
                      <div className="flex gap-2 items-center">
                        <button
                          className="px-2 py-1 border rounded text-sm flex items-center gap-1"
                          onClick={() => setView(view === "grid" ? "table" : "grid")}
                        >
                          {view === "grid" ? <FaTable /> : <FaTh />}
                          {view === "grid" ? "Table" : "Grid"}
                        </button>
                        {isAdmin && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            ADMIN VIEW
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center mb-4 gap-2">
                      <FaSearch className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search member..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded"
                      />
                    </div>

                    {view === "grid" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMembers.map((m) => (
                          <div key={m.userId} className="bg-gray-50 rounded-lg p-4 shadow hover:shadow-md transition">
                            <div className="flex items-center gap-3 mb-3">
                              {m.avatarUrl ? (
                                <img src={m.avatarUrl} alt={m.email} className="w-10 h-10 rounded-full" />
                              ) : (
                                <FaUserCircle className="text-4xl text-gray-400" />
                              )}
                              <div className="flex flex-col">
                                <span className="font-medium truncate">{m.email}</span>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      m.role === "ADMIN"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {m.role}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      m.status === "ACTIVE"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {m.status}
                                  </span>
                                </div>
                                {m.tasks && (
                                  <div className="text-xs mt-1">
                                    Open: {m.tasks.open}, In Progress: {m.tasks.inProgress}, Done: {m.tasks.done}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              {m.userId === loggedInUserId && m.status === "INVITED" && (
                                <button
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                  onClick={() => handleAcceptInvite(m)}
                                >
                                  Accept
                                </button>
                              )}

                              {isAdmin && m.userId !== loggedInUserId && (
                                <>
                                  <button
                                    className="px-3 py-1 border rounded text-sm"
                                    onClick={() => handleChangeRole(m)}
                                  >
                                    {m.role === "ADMIN" ? "Demote" : "Promote"}
                                  </button>
                                  <button
                                    className="px-3 py-1 border rounded text-sm text-red-600"
                                    onClick={() => handleRemove(m)}
                                  >
                                    Remove
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <table className="w-full border-collapse border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-2 py-1 text-center">Avatar</th>
                            <th className="border px-2 py-1 text-center">Email</th>
                            <th className="border px-2 py-1 text-center">Role</th>
                            <th className="border px-2 py-1 text-center">Status</th>
                            <th className="border px-2 py-1 text-center">Tasks</th>
                            {isAdmin && <th className="border px-2 py-1 text-center">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.map((m) => (
                            <tr key={m.userId} className="hover:bg-gray-50">
                              <td className="border px-2 py-1">
                                {m.avatarUrl ? (
                                  <img src={m.avatarUrl} alt={m.email} className="w-8 h-8 rounded-full" />
                                ) : (
                                  <FaUserCircle className="text-xl text-gray-400" />
                                )}
                              </td>
                              <td className="border px-2 py-1  text-center">{m.email}</td>
                              <td className="border px-2 py-1 text-center">{m.role}</td>
                              <td className="border px-2 py-1 text-center">{m.status}</td>
                              <td className="border px-2 py-1 text-center">
                                {m.tasks
                                  ? `Open: ${m.tasks.open}, In Progress: ${m.tasks.inProgress}, Done: ${m.tasks.done}`
                                  : "-"}
                              </td>
                              {isAdmin && (
                                <td className="border px-2 py-1 flex gap-1">
                                  {m.userId !== loggedInUserId && (
                                    <>
                                      <button
                                        className="px-2 py-1 border rounded text-xs text-center"
                                        onClick={() => handleChangeRole(m)}
                                      >
                                        {m.role === "ADMIN" ? "Demote" : "Promote"}
                                      </button>
                                      <button
                                        className="px-2 py-1 border rounded text-xs text-red-600  text-center   "
                                        onClick={() => handleRemove(m)}
                                      >
                                        Remove
                                      </button>
                                    </>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {isAdmin && (
                      <div className="mt-6 border-t pt-4">
                        <h3 className="text-sm font-semibold mb-2">Invite Member</h3>
                        <div className="flex gap-2 items-center flex-wrap">
                          <div className="relative w-72">
                            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                            <input
                              type="email"
                              placeholder="email@company.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              className="pl-10 pr-3 py-2 border rounded w-full"
                            />
                          </div>
                          <button
                            onClick={handleInvite}
                            disabled={inviting || !inviteEmail.includes("@")}
                            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                          >
                            {inviting ? "Inviting…" : "Invite"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        };

        export default TeamPage;
