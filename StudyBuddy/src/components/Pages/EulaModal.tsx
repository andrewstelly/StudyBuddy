// components/pages/Eula.tsx
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Cookies from "js-cookie";
import styles from "../Styling/Eula.module.scss";
import { Button } from "../UI/Button";
import { Checkbox } from "../UI/checkbox";

interface EulaModalProps {
  onClose: () => void;
}

const EulaModal: React.FC<EulaModalProps> = ({ onClose }) => {
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    Cookies.set("eula_accepted", "true", { expires: 365 });
    onClose();
  };

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        {/* 🔥 Actual translucent + blurred backdrop */}
        <div className="custom-eula-backdrop" />

        <Dialog.Content
          className={styles.modalContent}
          aria-describedby="eula-description"
        >
          <Dialog.Title className={styles.titleCentered}>
            End User License Agreement (EULA)
          </Dialog.Title>

          <div id="eula-description" className={styles.scrollBox}>
            <p>
              Our app allows the upload and recording of audio and video. 
              You must follow your local laws regarding consent. 
              Some U.S. states (like California, Florida, Pennsylvania) require all parties to consent.
            </p>
            <p>
              <strong>
                We are not liable for consequences resulting from improper use
                of recording features.
              </strong>
            </p>

            <h2>Terms:</h2>
            <ul>
              <li>Do not use this app for illegal activity.</li>
              <li>We reserve the right to revoke access at any time.</li>
            </ul>
          </div>

          <div className={styles.checkboxRow}>
          <input
              type="checkbox"
              id="eula-confirm"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className={styles.checkbox}
            />

            <label htmlFor="eula-confirm">
              I have read and agree to the terms above.
            </label>
          </div>

          <Button
            onClick={handleAccept}
            disabled={!checked}
            className={styles.acceptBtn}
          >
            I Agree
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EulaModal;
