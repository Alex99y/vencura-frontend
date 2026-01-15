"use client";

import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

interface SignModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: string | { toAddress: string; amount: string }, password: string) => Promise<unknown>;
  loading?: boolean;
  title: string;
  buttonText: string;
  type: "message" | "transaction";
}

export default function SignModal({
  show,
  onHide,
  onSubmit,
  loading = false,
  title,
  buttonText,
  type,
}: SignModalProps) {
  const [message, setMessage] = React.useState("");
  const [toAddress, setToAddress] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (type === "message") {
      if (!message.trim()) {
        setError("Message is required");
        return;
      }
    } else {
      if (!toAddress.trim()) {
        setError("To Address is required");
        return;
      }
      if (!amount.trim()) {
        setError("Amount is required");
        return;
      }
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setIsSubmitting(true);
      let result;
      if (type === "message") {
        result = await onSubmit(message.trim(), password);
      } else {
        result = await onSubmit({ toAddress: toAddress.trim(), amount: amount.trim() }, password);
      }
      // Store success result
      setSuccess(result);
      // Reset form on success
      setMessage("");
      setToAddress("");
      setAmount("");
      setPassword("");
      // Don't close modal immediately, let user see the success message
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      setMessage("");
      setToAddress("");
      setAmount("");
      setPassword("");
      setError(null);
      setSuccess(null);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
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
          {success !== null && (
            <div className="alert alert-success" role="alert">
              <strong>Success!</strong>
              <pre className="mb-0 mt-2" style={{ whiteSpace: "pre-wrap", fontSize: "0.875rem" }}>
                {JSON.stringify(success, null, 2)}
              </pre>
            </div>
          )}
          {type === "message" ? (
            <Form.Group className="mb-3" controlId="message">
              <Form.Label>
                Message <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting || loading}
                required
              />
            </Form.Group>
          ) : (
            <>
              <Form.Group className="mb-3" controlId="toAddress">
                <Form.Label>
                  To Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter recipient address"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  disabled={isSubmitting || loading}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="amount">
                <Form.Label>
                  Amount <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting || loading}
                  required
                />
              </Form.Group>
            </>
          )}
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
              required
            />
          </Form.Group>
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
              isSubmitting ||
              loading ||
              !password ||
              (type === "message"
                ? !message.trim()
                : !toAddress.trim() || !amount.trim())
            }
          >
            {isSubmitting || loading ? "Submitting..." : buttonText}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

