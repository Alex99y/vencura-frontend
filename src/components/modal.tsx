"use client";

import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

interface CreateAccountModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (
    alias: string,
    password: string,
    newPassword?: string
  ) => Promise<void>;
  loading?: boolean;
  title: string;
  buttonText: string;
  isEdit?: boolean;
}

export default function CreateAccountModal({
  show,
  onHide,
  onSubmit,
  loading = false,
  title,
  buttonText,
  isEdit = false,
}: CreateAccountModalProps) {
  const [alias, setAlias] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!alias.trim() && !isEdit) {
      setError("Alias is required");
      return;
    }

    if (!password && !isEdit) {
      setError("Password is required");
      return;
    }

    if (password && isEdit && !newPassword) {
      setError("New password is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(alias.trim(), password, newPassword);
      // Reset form on success
      setAlias("");
      setPassword("");
      onHide();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      setAlias("");
      setPassword("");
      setError(null);
      onHide();
    }
  };

  return (
    <Modal show={show} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Form.Group className="mb-3" controlId="alias">
            <Form.Label>
              Alias <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              disabled={isSubmitting || loading}
              {...(isEdit ? {} : { required: true })}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>
              Password <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || loading}
              {...(isEdit ? {} : { required: true })}
            />
          </Form.Group>
          {isEdit && (
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>
                New Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting || loading}
                {...(isEdit ? {} : { required: true })}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={
              isSubmitting || loading || !(alias || password || newPassword)
            }
          >
            {isSubmitting || loading ? "Submitting..." : buttonText}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
