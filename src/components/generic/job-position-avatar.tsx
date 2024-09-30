import { JobPosition } from "generated/client";
import { MdiIconifyIconWithBackground } from "./mdi-icon-with-background";

/**
 * Component properties
 */
type Props = {
  jobPosition?: JobPosition;
};

/**
 * Job position avatar component
 *
 * @param props component properties
 */
const JobPositionAvatar = ({ jobPosition }: Props) => (
  <MdiIconifyIconWithBackground iconName={jobPosition?.iconName} backgroundColor={jobPosition?.color} />
);

export default JobPositionAvatar;
