import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, recipeTitle }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="delete-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="delete-modal-content"
                    initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.8, rotate: 5, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="modal-stripe-pattern"></div>
                    <div className="modal-header">
                        <span className="modal-warning-icon">⚠</span>
                        <h2>SCRAP THIS DISH?</h2>
                    </div>

                    <div className="modal-body">
                        <p>Are you sure you want to delete <strong>"{recipeTitle}"</strong>?</p>
                        <p className="modal-subtext">This action cannot be undone. The recipe will be lost in the sauce forever.</p>
                    </div>

                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={onClose}>
                            KEEP IT
                        </button>
                        <button className="btn-delete" onClick={onConfirm}>
                            YES, TRASH IT
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DeleteConfirmationModal;
