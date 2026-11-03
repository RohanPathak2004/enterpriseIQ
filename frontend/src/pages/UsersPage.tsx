import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldOff, UserCog } from "lucide-react";
import { createUser, deleteUser, listUsers, updateUser } from "@/api/users";
import type { User, UserRole } from "@/types";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Field, inputClass } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { formatDate } from "@/utils/format";

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("EMPLOYEE");
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const mutation = useMutation({
    mutationFn: () => createUser({ name, email, password, role }),
    onSuccess: () => {
      notify("Account created.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (err) => notify(getApiErrorMessage(err, "Couldn't create this account."), "error"),
  });

  return (
    <Modal title="Add a person" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        {mutation.isError && <ErrorBanner message={getApiErrorMessage(mutation.error, "Couldn't create this account.")} />}
        <Field label="Full name" htmlFor="name">
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Work email" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Temporary password" htmlFor="password" hint="At least 8 characters.">
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Role" htmlFor="role">
          <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClass}>
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create account
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.is_active);
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const mutation = useMutation({
    mutationFn: () => updateUser(user.id, { name, role, is_active: isActive }),
    onSuccess: () => {
      notify("Account updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (err) => notify(getApiErrorMessage(err, "Couldn't update this account."), "error"),
  });

  return (
    <Modal title={`Edit ${user.name}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        {mutation.isError && <ErrorBanner message={getApiErrorMessage(mutation.error, "Couldn't update this account.")} />}
        <Field label="Full name" htmlFor="edit-name">
          <input id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Role" htmlFor="edit-role">
          <select id="edit-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClass}>
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-brass" />
          Account is active
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const { data, isLoading, error } = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      notify("Account removed.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setPendingDelete(null);
    },
    onError: (err) => notify(getApiErrorMessage(err, "Couldn't remove this account."), "error"),
  });

  if (isLoading) return <Spinner label="Loading people…" />;
  if (error) return <ErrorBanner message={getApiErrorMessage(error, "Couldn't load users.")} />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">Manage who can sign in and what they're allowed to do.</p>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Add person
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-panel">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-paper/60 text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
              <th className="px-5 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(data ?? []).map((u) => (
              <tr key={u.id} className="hover:bg-paper/40">
                <td className="px-5 py-3">
                  <p className="font-medium text-ink">
                    {u.name} {u.id === currentUser?.id && <span className="text-xs text-ink-faint">(you)</span>}
                  </p>
                  <p className="text-xs text-ink-faint">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(u.role)}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.is_active ? "success" : "danger"}>{u.is_active ? "Active" : "Deactivated"}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      title="Edit"
                      onClick={() => setEditing(u)}
                      className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                    >
                      <UserCog size={15} />
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        title="Remove"
                        onClick={() => setPendingDelete(u)}
                        className="rounded p-1.5 text-ink-faint hover:bg-signal-danger/10 hover:text-signal-danger"
                      >
                        <ShieldOff size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} />}

      {pendingDelete && (
        <Modal title="Remove account" onClose={() => setPendingDelete(null)}>
          <p className="text-sm text-ink-muted">
            Remove <span className="font-medium text-ink">{pendingDelete.name}</span>'s account? They'll lose access
            immediately.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(pendingDelete.id)}>
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
